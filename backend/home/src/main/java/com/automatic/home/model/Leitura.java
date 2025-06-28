package com.automatic.home.model;

import java.util.Date;

import jakarta.persistence.*;

@Entity
@Table(name = "leitura_sensor")
public class Leitura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nome do dispositivo (ex: "luz")
    @Column(nullable = false)
    private Double leitura1;
    
    
    private Double leitura2;
    


    
    
	@ManyToOne
	@JoinColumn(name = "id_dispositivo")
	private Dispositivo dispositivo;

	private Date dataHora;



	public Long getId() {
		return id;
	}





	public void setId(Long id) {
		this.id = id;
	}





	public Double getLeitura1() {
		return leitura1;
	}





	public void setLeitura1(Double leitura1) {
		this.leitura1 = leitura1;
	}





	public Double getLeitura2() {
		return leitura2;
	}





	public void setLeitura2(Double leitura2) {
		this.leitura2 = leitura2;
	}





	public Dispositivo getDispositivo() {
		return dispositivo;
	}





	public void setDispositivo(Dispositivo dispositivo) {
		this.dispositivo = dispositivo;
	}





	public Date getDataHora() {
		return dataHora;
	}





	public void setDataHora(Date dataHora) {
		this.dataHora = dataHora;
	}
  

   




    
    
}
