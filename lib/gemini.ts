export async function generateSyair(data: any) {
  try {
    const response = await fetch("/api/generate-syair", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.text || "Angka menanti di balik tabir,\nHarapan cerah dalam takdir.";
  } catch (error) {
    console.error("Error generating syair:", error);
    return "Angka menanti di balik tabir,\nHarapan cerah dalam takdir.";
  }
}

export async function generatePredictionImage(data: any) {
  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.imageUrl || `https://picsum.photos/seed/mystical-fantasy-oracle-${Date.now()}/1200/480?blur=2`;
  } catch (error) {
    console.error("Error generating image:", error);
    return `https://picsum.photos/seed/mystical-fantasy-oracle-${Date.now()}/1200/480?blur=2`;
  }
}
