import { PokemonService } from "../../../frontend/src/app/core/services/pokemon.service";

const bulbasaurResponse = {
  id: 1,
  name: "bulbasaur",
  sprites: {
    other: {
      "official-artwork": {
        front_default: "https://example.test/bulbasaur.png",
      },
    },
  },
  types: [{ type: { name: "grass" } }, { type: { name: "poison" } }],
};

describe("PokemonService", () => {
  it("lädt Pokémon-Daten aus der PokeAPI für das aktuelle Level", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(bulbasaurResponse), { status: 200 }),
    );

    const service = new PokemonService();
    await service.loadForLevel(1);

    expect(service.snapshot().displayName).toBe("Bulbasaur");
    expect(service.snapshot().spriteUrl).toBe(
      "https://example.test/bulbasaur.png",
    );
    expect(service.snapshot().types).toEqual(["grass", "poison"]);
    expect(service.snapshot().source).toBe("api");
  });

  it("fällt bei PokeAPI-Fehlern auf lokale Pokémon-Daten zurück", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));

    const service = new PokemonService();
    await service.loadForLevel(35);

    expect(service.snapshot().displayName).toBe("Venusaur");
    expect(service.snapshot().source).toBe("fallback");
    expect(service.errorMessage()).toContain("lokales Ersatz-Sprite");
  });
});
