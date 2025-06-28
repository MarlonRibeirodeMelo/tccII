// src/main/java/com/automatic/home/controller/DispositivoController.java
package com.automatic.home.controller;

import com.automatic.home.model.Dispositivo;
import com.automatic.home.repository.DispositivoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dispositivos")
public class DispositivoController {

    @Autowired
    private DispositivoRepository dispositivoRepository;

    @GetMapping
    public List<Dispositivo> listarTodos() {
        return dispositivoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dispositivo> buscarPorId(@PathVariable Long id) {
        return dispositivoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Dispositivo criar(@RequestBody Dispositivo disp) {
        return dispositivoRepository.save(disp);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Dispositivo> atualizar(@PathVariable Long id,
                                                 @RequestBody Dispositivo dados) {
        if (!dispositivoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        dados.setId(id);
        Dispositivo atualizado = dispositivoRepository.save(dados);
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!dispositivoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        dispositivoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
