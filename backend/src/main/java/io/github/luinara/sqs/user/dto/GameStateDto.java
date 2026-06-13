package io.github.luinara.sqs.user.dto;

import java.util.List;

public class GameStateDto {
    private int waterLevel;
    private int foodLevel;
    private String pokemonImageUrl;
    private int pokemonLevel;
    private int growth;
    private int happiness;
    private List<TaskDto> tasks;
    private int streak;
    private boolean yesterdayLoggedIn;
    private String serverNow;

    public GameStateDto() {}

    // getters and setters
    public int getWaterLevel() { return waterLevel; }
    public void setWaterLevel(int waterLevel) { this.waterLevel = waterLevel; }

    public int getFoodLevel() { return foodLevel; }
    public void setFoodLevel(int foodLevel) { this.foodLevel = foodLevel; }

    public String getPokemonImageUrl() { return pokemonImageUrl; }
    public void setPokemonImageUrl(String pokemonImageUrl) { this.pokemonImageUrl = pokemonImageUrl; }

    public int getPokemonLevel() { return pokemonLevel; }
    public void setPokemonLevel(int pokemonLevel) { this.pokemonLevel = pokemonLevel; }

    public int getGrowth() { return growth; }
    public void setGrowth(int growth) { this.growth = growth; }

    public int getHappiness() { return happiness; }
    public void setHappiness(int happiness) { this.happiness = happiness; }

    public List<TaskDto> getTasks() { return tasks; }
    public void setTasks(List<TaskDto> tasks) { this.tasks = tasks; }

    public int getStreak() { return streak; }
    public void setStreak(int streak) { this.streak = streak; }

    public boolean isYesterdayLoggedIn() { return yesterdayLoggedIn; }
    public void setYesterdayLoggedIn(boolean yesterdayLoggedIn) { this.yesterdayLoggedIn = yesterdayLoggedIn; }

    public String getServerNow() { return serverNow; }
    public void setServerNow(String serverNow) { this.serverNow = serverNow; }
}
