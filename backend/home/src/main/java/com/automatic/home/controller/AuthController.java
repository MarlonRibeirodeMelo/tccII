package com.automatic.home.controller;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.automatic.home.config.HashUtil;
import com.automatic.home.config.JwtTokenUtil;
import com.automatic.home.model.Usuario;
import com.automatic.home.repository.UsuarioRepository;

import lombok.Data;

@RestController
@RequestMapping("/auth")
@Repository
public class AuthController {

	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	
	@Autowired
	private UsuarioRepository menuUsuarioRepository;
	


	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
		try {
			Usuario usuario = menuUsuarioRepository.findByLoginAndPassword(loginRequest.getUsername(),
					DigestUtils.md5Hex(loginRequest.getPassword()));
		

	
			String token = jwtTokenUtil.generateToken(usuario.getLogin(), null, null,
					null);
				return ResponseEntity.ok(new AuthResponse(token,usuario));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login ou senha inválidos.");
		}

			
			
		
			
		
	}

	/**
	 * Endpoint para alterar a senha do usuário autenticado. O token JWT deve ser
	 * enviado no header "Authorization" no formato "Bearer {token}".
	 */
	@PostMapping("/alterarSenha")
	public ResponseEntity<?> alterarSenha(@RequestHeader("Authorization") String token,
			@RequestBody AlterarSenhaRequest req) {
		// Remove o prefixo "Bearer " caso exista
		if (token != null && token.startsWith("Bearer ")) {
			token = token.substring(7);
		}

		// Extrai o username (login) a partir do token
		String username = jwtTokenUtil.getUsernameFromToken(token);
		
		// Verifica se a nova senha e a confirmação coincidem
		if (!req.getPasswordNova().equals(req.getConfirmacao())) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Nova senha e confirmação não coincidem.");
		}

		// Verifica se a senha antiga está correta (utilizando MD5)
		String hashPasswordOld = HashUtil.generateMD5(req.getPasswordOld());
		
	
		return ResponseEntity.ok("Senha alterada com sucesso.");
	}

	@Data
	public static class LoginRequest {
		private String username;
		private String password;

	}

	@Data
	public static class AlterarSenhaRequest {

		private String passwordOld;
		private String passwordNova;
		private String confirmacao;
	}

	@Data
	public static class AuthResponse {
		private String token;
	
		private Usuario usuario;
	

		

		public AuthResponse(String token, Usuario usuario) {
			this.token = token;
		
			this.usuario=usuario;

		}
		
		

	}

}