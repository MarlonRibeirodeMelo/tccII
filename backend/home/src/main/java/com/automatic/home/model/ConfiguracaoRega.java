package com.automatic.home.model;


import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "configuracao_rega")
public class ConfiguracaoRega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String modo; // "automatica", "manual", "agendada"

    private String diasSemana; // CSV: "Segunda,Quarta"

    private LocalTime horario;
 
    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getModo() {
        return modo;
    }

    public void setModo(String modo) {
        this.modo = modo;
    }

    public String getDiasSemana() {
        return diasSemana;
    }

    public void setDiasSemana(String diasSemana) {
        this.diasSemana = diasSemana;
    }

    public LocalTime getHorario() {
        return horario;
    }

    public void setHorario(LocalTime horario) {
        this.horario = horario;
    }

   
}
