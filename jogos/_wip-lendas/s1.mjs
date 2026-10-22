export default async (p, log) => {
  log('init:', await p.evaluate(() => T.init()));
  const pares = [['kao','saci',0],['iara','curupira',1],['mapinguari','anhanga',2],['anhanga','kao',3],['saci','mapinguari',4],['curupira','iara',1]];
  for (const [a,b,e] of pares) {
    const r = await p.evaluate(([a,b,e]) => T.jogar(a,b,e,1,60*60*5), [a,b,e]);
    log(a,'x',b, typeof r === 'string' ? r : JSON.stringify({fase:r.fase,rd:r.rd,vit:r.vit,passos:r.passos,timer:r.timer,A:r.A,B:r.B,nan:r.nan,stats:r.stats}));
  }
  log('sfx:', await p.evaluate(() => JSON.stringify(Som.log)));
};
