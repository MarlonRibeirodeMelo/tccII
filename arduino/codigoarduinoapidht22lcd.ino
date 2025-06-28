#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <SPI.h>
#include <Ethernet.h>

// ==== LCD I2C ====
#define LCD_ADDR 0x27
#define LCD_COLS 20
#define LCD_ROWS 4
LiquidCrystal_I2C lcd(LCD_ADDR, LCD_COLS, LCD_ROWS);

// ==== Sensor DHT22 ====
#define DHTPIN 2
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// ==== Sensores analógicos ====
#define PIN_SOLO A0
#define PIN_CHUVA A1

// ==== Relé de irrigação ====
#define PIN_RELE 4
#define TEMPO_IRRIGACAO 5000  // 5 segundos

// ==== Ethernet ====
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
EthernetClient client;
const char server[] = "192.168.2.14";
const int serverPort = 8564;

// ==== Intervalo de envio ====
const unsigned long sendInterval = 10000UL;
unsigned long lastSend = 0;

// ==== Média e calibração ====
const int N_SAMPLES = 5;
const float TEMP_OFFSET = -1.2;

void setup() {
  Serial.begin(9600);
  Wire.begin();
  lcd.init();
  lcd.backlight();
  dht.begin();
  pinMode(PIN_RELE, OUTPUT);
  digitalWrite(PIN_RELE, LOW); // relé desligado no início

  if (Ethernet.begin(mac) == 0) {
    Serial.println("Falha no DHCP");
  } else {
    Serial.print("IP local: ");
    Serial.println(Ethernet.localIP());
  }

  lcd.setCursor(0, 0);
  lcd.print("Inicializando...");
  delay(2000);
  lcd.clear();
}

void loop() {
  // ======= Leitura do DHT22 (média) =======
  float sumT = 0, sumH = 0;
  int valid = 0;
  for (int i = 0; i < N_SAMPLES; i++) {
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    if (!isnan(h) && !isnan(t)) {
      sumH += h;
      sumT += t;
      valid++;
    }
    delay(200);
  }
  float tMed = valid ? (sumT / valid) + TEMP_OFFSET : NAN;
  float hMed = valid ? sumH / valid : NAN;

  // ======= Leitura do solo e chuva =======
  int solo = analogRead(PIN_SOLO);
  int chuva = analogRead(PIN_CHUVA);

  // ======= Exibição no LCD =======
  lcd.setCursor(0, 0);
  lcd.print("T:");
  isnan(tMed) ? lcd.print("---.-") : lcd.print(tMed, 1);
  lcd.print((char)223); lcd.print("C ");

  lcd.setCursor(0, 1);
  lcd.print("U:");
  isnan(hMed) ? lcd.print("--.-%") : lcd.print(hMed, 1), lcd.print("% ");

  lcd.setCursor(0, 2);
  lcd.print("Solo:"); lcd.print(solo);
  lcd.print(" Ch:"); lcd.print(chuva);

  // ======= Envio e irrigação =======
  if (millis() - lastSend >= sendInterval) {
    lastSend = millis();
    lcd.setCursor(0, 3);
    lcd.print("Enviando API...   ");
    if (!isnan(tMed) && !isnan(hMed)) sendToApi(tMed, hMed, 1);
    sendToApi(solo, 0, 2);
    sendToApi(chuva, 0, 3);

    // === Aciona irrigação ===
    irrigar();
  }
}

// ==== Envio para API ====
void sendToApi(float leitura1, float leitura2, int idDispositivo) {
  if (client.connect(server, serverPort)) {
    String json = String("{") +
      "\"leitura1\":" + String(leitura1, 2);
    if (leitura2 != 0) {
      json += ",\"leitura2\":" + String(leitura2, 2);
    }
    json += "}";

    client.println("POST /api/leituras/" + String(idDispositivo) + " HTTP/1.1");
    client.print("Host: ");
    client.print(server);
    client.print(":");
    client.println(serverPort);
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(json.length());
    client.println();
    client.print(json);
    client.stop();

    Serial.print("Enviado ID ");
    Serial.print(idDispositivo);
    Serial.print(": ");
    Serial.println(json);
  } else {
    Serial.println("Falha na conexão com API.");
  }
}

// ==== Irrigação (aciona o relé) ====
void irrigar() {
  Serial.println("Iniciando irrigação...");
  lcd.setCursor(0, 3);
  lcd.print("Irrigando...       ");
  digitalWrite(PIN_RELE, HIGH);
  delay(TEMPO_IRRIGACAO);
  digitalWrite(PIN_RELE, LOW);
  lcd.setCursor(0, 3);
  lcd.print("Irrigacao concluida");
}
