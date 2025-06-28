package com.automatic.home.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.automatic.home.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
	Usuario findByLoginAndPassword(String login,String senha);
	Usuario findByLogin(String login);
	
}
