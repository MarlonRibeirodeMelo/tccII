// src/main/java/com/automatic/home/repository/DispositivoRepository.java
package com.automatic.home.repository;

import com.automatic.home.model.Dispositivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DispositivoRepository extends JpaRepository<Dispositivo, Long> {
}
