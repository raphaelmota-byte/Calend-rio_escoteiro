#!/usr/bin/env bash
# Interrompe o script se ocorrer algum erro
set -o errexit

echo "Instalando dependências com uv..."
uv sync

echo "Aplicando migrações no banco de dados..."
uv run python manage.py migrate

echo "Criando superusuário..."
# O "|| true" no final é importante para que o deploy não falhe nos próximos
# pushs caso o usuário já tenha sido criado na primeira vez.
uv run python manage.py createsuperuser --noinput || true