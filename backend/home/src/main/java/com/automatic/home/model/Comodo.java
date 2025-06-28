package com.automatic.home.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "comodos")
@Data
public class Comodo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nome do dispositivo (ex: "luz")
    @Column(nullable = false)
    private String nome;
    private String nomeTela;
    private String descricaoAba;
    private String caminho;
    private Boolean status;
    
}
