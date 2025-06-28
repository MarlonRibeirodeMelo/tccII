package com.automatic.home.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/acoes")
public class AcaoController {

    @PostMapping("/hirrigarHorta")
    public ResponseEntity<String> iniciarIrrigacao() {
        // Aqui você pode acionar um relé, enviar um comando MQTT, ou apenas simular
        System.out.println("💧 Irrigação iniciada manualmente.");

        // Simulação de sucesso
        return ResponseEntity.ok("Irrigação iniciada com sucesso.");
    }
}
