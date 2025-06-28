package com.automatic.home.model;

import jakarta.persistence.*;

@Entity
@Table(name = "dispositivo")
public class Dispositivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nome do dispositivo (ex: "luz")
    @Column(nullable = false)
    private String nome;

    // Tipo do dispositivo (ex: "interruptor")
    @Column(nullable = false)
    private String tipo;

	@ManyToOne
	@JoinColumn(name = "id_comodo")
	private Comodo comodo;
	
    // Status do dispositivo (ex: "ligado" ou "desligado")
    @Column(nullable = false)
    private String status;
 
    private Boolean isAnalog;
    
    

  

   



	// Getters e Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    

    public Comodo getComodo() {
		return comodo;
	}

	public void setComodo(Comodo comodo) {
		this.comodo = comodo;
	}

	public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

	

	public Boolean getIsAnalog() {
		return isAnalog;
	}

	public void setIsAnalog(Boolean isAnalog) {
		this.isAnalog = isAnalog;
	}


    
    
}
