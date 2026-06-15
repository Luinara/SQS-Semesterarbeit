package io.github.luinara.sqs.user.dto;

import java.util.ArrayList;
import java.util.List;

public class GameStateDto {
    private int waterLevel;
    private int foodLevel;
    private Integer currentPokemonId;
    private String pokemonImageUrl;
    private String pokemonName;
    private int pokemonLevel;
    private int growth;
    private int happiness;
    private int pendingFeedPoints; // new
    private List<TaskCompletionDto> tasks;
    private int streak;
    private boolean yesterdayLoggedIn;
    private String serverNow;

    public GameStateDto() {
    }

    // getters and setters
    public int getWaterLevel() {
        return waterLevel;
    }

    public void setWaterLevel(int waterLevel) {
        this.waterLevel = waterLevel;
    }

    public int getFoodLevel() {
        return foodLevel;
    }

    public void setFoodLevel(int foodLevel) {
        this.foodLevel = foodLevel;
    }

    public Integer getCurrentPokemonId() {
        return currentPokemonId;
    }

    public void setCurrentPokemonId(Integer currentPokemonId) {
        this.currentPokemonId = currentPokemonId;
    }

    public String getPokemonImageUrl() {
        return pokemonImageUrl;
    }

    public void setPokemonImageUrl(String pokemonImageUrl) {
        this.pokemonImageUrl = pokemonImageUrl;
    }

    public String getPokemonName() {
        return pokemonName;
    }

    public void setPokemonName(String pokemonName) {
        this.pokemonName = pokemonName;
    }

    public int getPokemonLevel() {
        return pokemonLevel;
    }

    public void setPokemonLevel(int pokemonLevel) {
        this.pokemonLevel = pokemonLevel;
    }

    public int getGrowth() {
        return growth;
    }

    public void setGrowth(int growth) {
        this.growth = growth;
    }

    public int getHappiness() {
        return happiness;
    }

    public void setHappiness(int happiness) {
        this.happiness = happiness;
    }

    public int getPendingFeedPoints() {
        return pendingFeedPoints;
    }

    public void setPendingFeedPoints(int pendingFeedPoints) {
        this.pendingFeedPoints = pendingFeedPoints;
    }

    public List<TaskCompletionDto> getTasks() {
        return tasks == null ? List.of() : new ArrayList<>(tasks);
    }

    public void setTasks(List<TaskCompletionDto> tasks) {
        this.tasks = tasks == null ? null : new ArrayList<>(tasks);
    }

    public int getStreak() {
        return streak;
    }

    public void setStreak(int streak) {
        this.streak = streak;
    }

    public boolean isYesterdayLoggedIn() {
        return yesterdayLoggedIn;
    }

    public void setYesterdayLoggedIn(boolean yesterdayLoggedIn) {
        this.yesterdayLoggedIn = yesterdayLoggedIn;
    }

    public String getServerNow() {
        return serverNow;
    }

    public void setServerNow(String serverNow) {
        this.serverNow = serverNow;
    }
}
