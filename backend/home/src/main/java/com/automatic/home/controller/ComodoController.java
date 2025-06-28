// src/main/java/com/automatic/home/controller/ComodoController.java
package com.automatic.home.controller;

import com.automatic.home.model.Comodo;
import com.automatic.home.repository.ComodoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comodos")
public class ComodoController {

    @Autowired
    private ComodoRepository comodoRepository;

    @GetMapping
    public List<Comodo> listarTodos() {
        return comodoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comodo> buscarPorId(@PathVariable Long id) {
        return comodoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/listarPorStatus")
    public ResponseEntity<List<Comodo>> listarPorStatus() {          
        List<Comodo> comodos = comodoRepository.findAllByStatusTrue();
        return ResponseEntity.ok(comodos);                          
    }

    @PostMapping
    public Comodo criar(@RequestBody Comodo comodo) {
        return comodoRepository.save(comodo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comodo> atualizar(@PathVariable Long id,
                                            @RequestBody Comodo dados) {
        if (!comodoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        dados.setId(id);
        Comodo atualizado = comodoRepository.save(dados);
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!comodoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        comodoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
