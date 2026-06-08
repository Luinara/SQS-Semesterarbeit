package io.github.luinara.sqs.domain;

import java.time.OffsetDateTime;

public class User {
    private Long id;
    private String username;
    private String passwordHash;
    private int currentPokemonId;
    private boolean isEgg = true;
    private int happiness = 0;
    private OffsetDateTime createdAt;
    private OffsetDateTime hatchedAt;

    public User() {
    }

    public User(Long id, String username, String passwordHash,
                int currentPokemonId, boolean isEgg, int happiness,
                OffsetDateTime createdAt, OffsetDateTime hatchedAt) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.currentPokemonId = currentPokemonId;
        this.isEgg = isEgg;
        this.happiness = happiness;
        this.createdAt = createdAt;
        this.hatchedAt = hatchedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public int getCurrentPokemonId() {
        return currentPokemonId;
    }

    public void setCurrentPokemonId(int currentPokemonId) {
        this.currentPokemonId = currentPokemonId;
    }

    public boolean isEgg() {
        return isEgg;
    }

    public void setEgg(boolean egg) {
        isEgg = egg;
    }

    public int getHappiness() {
        return happiness;
    }

    public void setHappiness(int happiness) {
        this.happiness = happiness;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getHatchedAt() {
        return hatchedAt;
    }

    public void setHatchedAt(OffsetDateTime hatchedAt) {
        this.hatchedAt = hatchedAt;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", currentPokemonId=" + currentPokemonId +
                ", isEgg=" + isEgg +
                ", happiness=" + happiness +
                ", createdAt=" + createdAt +
                ", hatchedAt=" + hatchedAt +
                '}';
    }

    // TODO: add domain-specific behaviour if needed
}
