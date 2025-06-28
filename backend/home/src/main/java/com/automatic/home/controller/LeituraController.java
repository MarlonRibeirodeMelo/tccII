// src/main/java/com/automatic/home/controller/LeituraController.java
package com.automatic.home.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.automatic.home.model.Dispositivo;
import com.automatic.home.model.Leitura;
import com.automatic.home.repository.DispositivoRepository;
import com.automatic.home.repository.LeituraRepository;

@RestController
@RequestMapping("/api/leituras")
public class LeituraController {

    @Autowired
    private LeituraRepository leituraRepository;
    @Autowired
    private DispositivoRepository dispositivoRepository;

    @GetMapping
    public List<Leitura> listarTodos() {
        return leituraRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Leitura> buscarPorId(@PathVariable Long id) {
        return leituraRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{idDispositivo}")
    public Leitura criar(@RequestBody Leitura leitura,@PathVariable int idDispositivo) {
    	Dispositivo d=dispositivoRepository.findById(Long.valueOf(idDispositivo)).get();
    	leitura.setDispositivo(d);
        return leituraRepository.save(leitura);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Leitura> atualizar(@PathVariable Long id,
                                             @RequestBody Leitura dados) {
        if (!leituraRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        dados.setId(id);
        Leitura atualizado = leituraRepository.save(dados);
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!leituraRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        leituraRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/listarUltimas/{idDispositivo}")
    public ResponseEntity<List<Leitura>> listarUltimasLeituras(@PathVariable Long idDispositivo) {
        List<Leitura> ultimas = leituraRepository.findTop20ByDispositivoIdOrderByDataHoraDesc(idDispositivo);
        return ResponseEntity.ok(ultimas);
    }
    
    
}
