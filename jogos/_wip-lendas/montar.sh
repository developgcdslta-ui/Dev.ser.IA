#!/bin/bash
# uso: montar.sh saida.html parte1 parte2 ...   (partes relativas a /tmp/jogo)
out="$1"; shift
: > "$out"
for p in "$@"; do
  case "$p" in /*) f="$p";; *) f="/tmp/jogo/$p";; esac
  cat "$f" >> "$out"; printf '\n' >> "$out"
done
