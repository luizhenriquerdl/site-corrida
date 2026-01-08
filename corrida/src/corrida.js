async function carregarCorridas() {
  const url = "https://ergast.com/api/f1/current.json";

  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();

    const corridas = dados.MRData.RaceTable.Races;

    const lista = document.getElementById("lista-corridas");
    lista.innerHTML = "";

    corridas.forEach(corrida => {
      const item = document.createElement("li");
      item.textContent = `${corrida.raceName} — ${corrida.Circuit.circuitName} (${corrida.date})`;
      lista.appendChild(item);
    });

  } catch (erro) {
    console.error("Erro ao carregar corridas:", erro);
  }
}

carregarCorridas();
