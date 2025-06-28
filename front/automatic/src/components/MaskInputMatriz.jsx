import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

const MaskedDecimalInput = ({ label, onChange, value, disabled }) => {
  const { user } = useAuth();
  // Número de casas decimais (default 2)
  const casasDecimais = user?.matriz?.casasDecimaisValorUnitario ?? 2;
  const fator = Math.pow(10, casasDecimais);

  // Valor exibido no TextField (formatado)
  const [localValue, setLocalValue] = useState("");
  // Acumulador de dígitos para montar o valor
  const [rawDigits, setRawDigits] = useState("");

  // Sempre que a prop "value" mudar (por exemplo, vindo do estado pai),
  // atualiza o campo e o acumulador de dígitos.
  useEffect(() => {
    if (typeof value === "number") {
      const formattedValue = value.toFixed(casasDecimais).replace(".", ",");
      setLocalValue(formattedValue);
      // Se houver valor, atualiza o acumulador com o valor inteiro correspondente
      // (ex.: 1,23 → "123"). Se não houver, limpa o acumulador.
      const novoRaw = value > 0 ? (value * fator).toFixed(0) : "";
      setRawDigits(novoRaw);
    } else {
      setLocalValue("");
      setRawDigits("");
    }
  }, [value, casasDecimais, fator]);

  // Ao focar, limpa o campo para que o usuário possa digitar.
  // Se o usuário não digitar nada, ao sair do campo o valor original será restaurado.
  const handleFocus = () => {
    setRawDigits("");
    setLocalValue("");
  };

  // Durante a digitação, captura a inserção ou remoção de dígitos
  // e atualiza o valor (formatado) chamando o onChange com o número.
  const handleInput = (event) => {
    const { inputType, data } = event.nativeEvent;
    if (inputType === "insertText" && data && /\d/.test(data)) {
      const novoRawDigits = rawDigits + data;
      setRawDigits(novoRawDigits);
      const numberValue = parseInt(novoRawDigits, 10) / fator;
      const formatted = numberValue.toFixed(casasDecimais).replace(".", ",");
      setLocalValue(formatted);
      onChange(numberValue);
    } else if (inputType === "deleteContentBackward") {
      // Se o usuário apagar, atualiza o acumulador
      const novoRawDigits = rawDigits.slice(0, -1);
      setRawDigits(novoRawDigits);
      // Se o acumulador ficar vazio, usamos o valor original (prop value)
      const numberValue =
        novoRawDigits.length > 0
          ? parseInt(novoRawDigits, 10) / fator
          : typeof value === "number"
          ? value
          : 0;
      const formatted = numberValue.toFixed(casasDecimais).replace(".", ",");
      setLocalValue(formatted);
      onChange(numberValue);
    }
    // Outros tipos de input podem ser tratados se necessário.
  };

  // Ao sair do campo, se o usuário não alterou o valor (rawDigits vazio),
  // restaura o valor recebido via prop.
  const handleBlur = () => {
    const finalNumber =
      rawDigits.length > 0
        ? parseInt(rawDigits, 10) / fator
        : typeof value === "number"
        ? value
        : 0;
    const formattedValue = finalNumber.toFixed(casasDecimais).replace(".", ",");
    setLocalValue(formattedValue);
    onChange(finalNumber);
  };

  return (
    <TextField
      label={label}
      variant="outlined"
      fullWidth
      value={localValue}
      onInput={handleInput}
      onBlur={handleBlur}
      onFocus={handleFocus}
      disabled={disabled || false}
      inputProps={{
        inputMode: "numeric", // Sempre teclado numérico
      }}
    />
  );
};

export default MaskedDecimalInput;
