package com.automatic.home.controller;


import com.automatic.home.model.ConfiguracaoRega;
import com.automatic.home.model.Dispositivo;
import com.automatic.home.repository.ConfiguracaoRegaRepository;
import com.automatic.home.repository.DispositivoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;

@RestController
@RequestMapping("/api/configuracoes")
public class ConfiguracaoRegaController {

    @Autowired
    private ConfiguracaoRegaRepository configuracaoRegaRepository;

    @Autowired
    private DispositivoRepository dispositivoRepository;

    @PostMapping("/rega")
    public ConfiguracaoRega salvarConfiguracao(@RequestBody ConfiguracaoRegaDTO dto) {
      

        ConfiguracaoRega config = null;
        if (config == null) config = new ConfiguracaoRega();

  
        config.setModo(dto.modo);
        config.setDiasSemana(dto.diasSemana);
        config.setHorario(LocalTime.parse(dto.horario));

        return configuracaoRegaRepository.save(config);
    }

    @GetMapping("/rega")
    public ConfiguracaoRega buscarConfiguracaoMaisRecente() {
        return configuracaoRegaRepository.buscarUltimaConfiguracao();
    }
    
    public static class ConfiguracaoRegaDTO {

        public String modo;
        public String diasSemana;
        public String horario; // "HH:mm"      
    }
    
}
