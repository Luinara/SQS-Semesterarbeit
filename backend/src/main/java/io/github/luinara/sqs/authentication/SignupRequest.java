package io.github.luinara.sqs.authentication;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public class SignupRequest {

    @NotBlank
    private String username;

    @NotBlank
    @Size(min = 8)
    private String password;

    @Min(1)
    @Max(151)
    private Integer starterPokemonId;

    public SignupRequest() {
    }

    public SignupRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public SignupRequest(String username, String password, Integer starterPokemonId) {
        this(username, password);
        this.starterPokemonId = starterPokemonId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getStarterPokemonId() {
        return starterPokemonId;
    }

    public void setStarterPokemonId(Integer starterPokemonId) {
        this.starterPokemonId = starterPokemonId;
    }
}
