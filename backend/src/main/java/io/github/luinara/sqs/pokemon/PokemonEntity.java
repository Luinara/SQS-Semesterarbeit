package io.github.luinara.sqs.pokemon;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "pokemon")
public class PokemonEntity {

    @Id
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "evolution_id")
    private Integer evolutionId;

    @Column(name = "evolution_stage")
    private Integer evolutionStage;

    public PokemonEntity() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getEvolutionId() { return evolutionId; }
    public void setEvolutionId(Integer evolutionId) { this.evolutionId = evolutionId; }

    public Integer getEvolutionStage() { return evolutionStage; }
    public void setEvolutionStage(Integer evolutionStage) { this.evolutionStage = evolutionStage; }
}
