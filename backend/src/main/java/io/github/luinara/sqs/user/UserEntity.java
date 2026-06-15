package io.github.luinara.sqs.user;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "username"))
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "current_pokemon_id")
    private Integer currentPokemonId;

    @Column(name = "is_egg")
    private boolean isEgg = true;

    @Column(name = "happiness")
    private int happiness = 0;

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "hatched_at")
    private OffsetDateTime hatchedAt;

    @Column(name = "hydration_ml")
    private int hydrationMl = 0;

    @Column(name = "hunger")
    private int hunger = 0;

    @Column(name = "pokemon_level")
    private int pokemonLevel = 1;

    @Column(name = "pokemon_xp")
    private int pokemonXp = 0;

    @Column(name = "streak")
    private int streak = 0;

    @Column(name = "last_task_completion_date")
    private OffsetDateTime lastTaskCompletionDate;

    @Column(name = "last_level_up_at")
    private OffsetDateTime lastLevelUpAt;

    @Column(name = "pending_feed_points")
    private int pendingFeedPoints = 0;

    @Version
    private Long version;

    public UserEntity() {
    }

    public UserEntity(String username, String passwordHash) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.createdAt = OffsetDateTime.now();
        this.isEgg = true;
        this.happiness = 0;
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

    public Integer getCurrentPokemonId() {
        return currentPokemonId;
    }

    public void setCurrentPokemonId(Integer currentPokemonId) {
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

    public OffsetDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(OffsetDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
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

    public int getHydrationMl() {
        return hydrationMl;
    }

    public void setHydrationMl(int hydrationMl) {
        this.hydrationMl = hydrationMl;
    }

    public int getHunger() {
        return hunger;
    }

    public void setHunger(int hunger) {
        this.hunger = hunger;
    }

    public int getPokemonLevel() {
        return pokemonLevel;
    }

    public void setPokemonLevel(int pokemonLevel) {
        this.pokemonLevel = pokemonLevel;
    }

    public int getPokemonXp() {
        return pokemonXp;
    }

    public void setPokemonXp(int pokemonXp) {
        this.pokemonXp = pokemonXp;
    }

    public int getStreak() {
        return streak;
    }

    public void setStreak(int streak) {
        this.streak = streak;
    }

    public OffsetDateTime getLastTaskCompletionDate() {
        return lastTaskCompletionDate;
    }

    public void setLastTaskCompletionDate(OffsetDateTime lastTaskCompletionDate) {
        this.lastTaskCompletionDate = lastTaskCompletionDate;
    }

    public OffsetDateTime getLastLevelUpAt() {
        return lastLevelUpAt;
    }

    public void setLastLevelUpAt(OffsetDateTime lastLevelUpAt) {
        this.lastLevelUpAt = lastLevelUpAt;
    }

    public int getPendingFeedPoints() {
        return pendingFeedPoints;
    }

    public void setPendingFeedPoints(int pendingFeedPoints) {
        this.pendingFeedPoints = pendingFeedPoints;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}
