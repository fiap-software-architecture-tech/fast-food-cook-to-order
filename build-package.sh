#!/bin/bash

# FastFood Cook-to-Order Lambda - Build and Package Script
# Este script automatiza o processo de build e criação do pacote de deployment

set -e

echo "🚀 FastFood Cook-to-Order Lambda - Build and Package"
echo "================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para mostrar progresso
show_step() {
    echo -e "\n${BLUE}[$(date '+%H:%M:%S')] $1${NC}"
}

# Função para mostrar sucesso
show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função para mostrar aviso
show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Função para mostrar erro
show_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    show_error "Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    show_error "npm não encontrado. Instale npm primeiro."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    show_error "Node.js versão 18+ é requerida. Versão atual: $(node --version)"
    exit 1
fi

show_step "Verificando ambiente..."
show_success "Node.js $(node --version) encontrado"
show_success "npm $(npm --version) encontrado"

# Configurações
BUILD_DIR="dist"
SOURCE_DIR="src"
PACKAGE_NAME="lambda-deployment.zip"

show_step "Limpando diretório de build..."
rm -rf $BUILD_DIR
rm -f $PACKAGE_NAME
show_success "Diretório limpo"

show_step "Criando estrutura de build..."
mkdir -p $BUILD_DIR
show_success "Estrutura criada"

show_step "Copiando código fonte..."
cp -r $SOURCE_DIR/* $BUILD_DIR/
show_success "Código copiado"

# Verificar se package.json existe
if [ -f "package.json" ]; then
    show_step "Instalando dependências de produção..."
    cp package.json $BUILD_DIR/
    
    # Copiar package-lock.json se existir
    if [ -f "package-lock.json" ]; then
        cp package-lock.json $BUILD_DIR/
    fi
    
    cd $BUILD_DIR
    npm ci --omit=dev
    cd ..
    show_success "Dependências instaladas"
else
    show_warning "package.json não encontrado, pulando instalação de dependências"
fi

show_step "Criando pacote de deployment..."
cd $BUILD_DIR
zip -r ../$PACKAGE_NAME . > /dev/null
cd ..
show_success "Pacote criado: $PACKAGE_NAME"

show_step "Limpando arquivos temporários..."
rm -rf $BUILD_DIR
show_success "Limpeza concluída"

# Verificar tamanho do pacote
PACKAGE_SIZE=$(ls -lh $PACKAGE_NAME | awk '{print $5}')
show_step "Validando pacote..."
show_success "Pacote final: $PACKAGE_NAME ($PACKAGE_SIZE)"

echo ""
echo "🎉 Build concluído com sucesso!"
echo "📦 Pacote: $PACKAGE_NAME"
echo "📁 Tamanho: $PACKAGE_SIZE"
echo ""
echo "Próximos passos:"
echo "1. cd terraform"
echo "2. terraform init"
echo "3. terraform plan"
echo "4. terraform apply"