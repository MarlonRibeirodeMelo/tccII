package com.automatic.home.config;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class CustomUserDetails implements UserDetails {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private String username;
 

    public CustomUserDetails(String username) {
       
    }

   

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Retorne as permissões ou roles do usuário aqui (se necessário)
        return null;
    }

    @Override
    public String getPassword() {
        // Pode retornar null se a senha não for necessária no contexto
        return null;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

	@Override
	public boolean isCredentialsNonExpired() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isEnabled() {
		// TODO Auto-generated method stub
		return true;
	}

  
}