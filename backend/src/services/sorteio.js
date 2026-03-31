function sortearTimes(jogadores) {
  // Ordena por nota (maior para menor)
  const ordenados = [...jogadores].sort((a, b) => b.nota - a.nota);

  const times = [[], [], []];

  ordenados.forEach((jogador, index) => {
    const rodada = Math.floor(index / 3);
    // Snake draft: rodadas pares → 0,1,2 / rodadas ímpares → 2,1,0
    let timeIndex;
    if (rodada % 2 === 0) {
      timeIndex = index % 3;
    } else {
      timeIndex = 2 - (index % 3);
    }
    times[timeIndex].push(jogador);
  });

  return times.map((jogadores, i) => ({
    time_numero: i + 1,
    jogadores,
    soma_notas: jogadores.reduce((acc, j) => acc + j.nota, 0),
  }));
}

module.exports = { sortearTimes };
