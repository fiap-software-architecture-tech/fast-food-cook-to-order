# FastFood Cook-to-Order - Microsserviço de Cozinha

![Node.js](https://img.shields.io/badge/Node.js-22.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-FF9900)
![DynamoDB](https://img.shields.io/badge/DynamoDB-4053D6)

## 📋 Sobre o Serviço

Microsserviço serverless responsável pelo gerenciamento da fila de preparação de pedidos na cozinha. Utiliza DynamoDB para alta performance em operações de leitura/escrita em tempo real.

## 🎯 Responsabilidades

### Core Business
- **Fila de Preparação**: Gerenciamento da fila de pedidos para a cozinha
- **Controle de Status**: Atualização de status de preparação dos pedidos
- **Priorização**: Ordenação de pedidos por prioridade e tempo
- **Notificações**: Alertas para a cozinha sobre novos pedidos
- **Dashboard**: Interface para acompanhamento em tempo real

### Integrações e Eventos
- **Recebe de Order**: Pedidos confirmados entram na fila
- **Atualiza Order**: Notifica mudanças de status de preparação
- **Eventos de Cozinha**: Publica eventos de progresso de preparação
- **Real-time Updates**: Atualizações em tempo real via WebSocket (futuro)

## 🏗️ Arquitetura

### Estrutura do Projeto

```
src/
├── application/            → Casos de uso
│   ├── services/           → Serviços de orquestração
│   └── use-cases/          → Implementação dos casos de uso
│       └── cook-to-order/  → Casos de uso de cozinha
│
├── domain/                 → Entidades e regras de negócio
│   ├── entities/           → CookOrder entity
│   ├── repositories/       → Interfaces de repositório
│   └── value-objects/      → PreparationStatus enum
│
├── infrastructure/         → Implementações técnicas
│   ├── config/             → Configuração e DI
│   ├── database/           → DynamoDB client
│   ├── repositories/       → Implementação DynamoDB
│   └── messaging/          → Publicação de eventos
│
├── interfaces/             → Controllers e HTTP
│   ├── controller/         → CTO controller
│   └── http/               → Routes, schemas, middlewares
│
└── main/                   → Entry point Lambda
    └── index.ts            → Lambda handler
```

### Por que DynamoDB?

O serviço de cozinha utiliza **DynamoDB** ao invés de MySQL por:

- **Alta Performance**: Latência de milissegundos para leitura/escrita
- **Escalabilidade Automática**: Ajusta capacidade conforme demanda
- **Operações Simples**: Principalmente CRUD por ID (sem JOINs complexos)
- **Real-time**: Ideal para atualizações frequentes de status
- **Custo-benefício**: Pay-per-request para workloads variáveis

### Modelo de Dados (DynamoDB)

```typescript
interface CookOrder {
  order_id: string;           // Partition Key
  order_number: number;
  status: PreparationStatus;
  items: OrderItem[];
  priority: number;
  created_at: string;
  updated_at: string;
}

enum PreparationStatus {
  RECEIVED      // Recebido na cozinha
  PREPARING     // Em preparação
  READY         // Pronto para retirada
  DELIVERED     // Entregue ao cliente
}
```

## 🛠️ Stack Tecnológica

### Core
- **Runtime**: Node.js 22.x
- **Linguagem**: TypeScript 5.x
- **Framework**: Fastify 5.x + @fastify/aws-lambda
- **Database**: Amazon DynamoDB (NoSQL)

### Bibliotecas Principais
- **AWS SDK**: @aws-sdk/client-dynamodb, @aws-sdk/util-dynamodb
- **Validação**: Zod
- **Injeção de Dependência**: InversifyJS
- **HTTP Client**: Axios
- **Documentação**: Swagger/OpenAPI
- **Logging**: Pino
- **Testes**: Vitest + @vitest/coverage-v8

### AWS Services
- **Lambda**: Compute serverless
- **API Gateway**: Endpoint HTTPS
- **DynamoDB**: Banco NoSQL de alta performance
- **CloudWatch**: Logs e monitoramento
- **EventBridge/SNS**: Mensageria (futuro)

## 🚀 Como Executar

### Pré-requisitos
- Node.js 22+
- AWS CLI configurado
- DynamoDB Local (opcional, para desenvolvimento)

### Instalação Local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Executar em modo desenvolvimento
npm run dev
```

### DynamoDB Local (Desenvolvimento)

```bash
# Instalar DynamoDB Local
docker run -p 8000:8000 amazon/dynamodb-local

# Criar tabela
aws dynamodb create-table \
  --table-name fastfood-orders-cook-to-order \
  --attribute-definitions AttributeName=order_id,AttributeType=S \
  --key-schema AttributeName=order_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000
```

### Build e Deploy

```bash
# Build da aplicação
npm run build

# Deploy via Terraform
cd terraform
terraform init
terraform apply
```

## 🧪 Testes e Cobertura

### Executar Testes

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:coverage
```

### Evidências de Cobertura

O microsserviço possui testes automatizados com cobertura de código usando Vitest.

**Cobertura Atual:**

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   78+   |   72+    |   76+   |   79+   |
 application/         |   82+   |   76+    |   80+   |   83+   |
 domain/              |   86+   |   80+    |   84+   |   87+   |
 infrastructure/      |   73+   |   68+    |   71+   |   74+   |
 interfaces/          |   80+   |   74+    |   78+   |   81+   |
----------------------|---------|----------|---------|---------|
```

Os testes cobrem:
- ✅ Adição de pedidos à fila
- ✅ Atualização de status
- ✅ Priorização de pedidos
- ✅ Integração com DynamoDB (mocked)
- ✅ Regras de negócio

## 📡 API Endpoints

### GET /cook-orders
Lista todos os pedidos na fila de preparação.

**Query Parameters:**
- `status` - Filtrar por status

**Response (200):**
```json
[
  {
    "order_id": "uuid",
    "order_number": 1,
    "status": "PREPARING",
    "items": [...],
    "priority": 1,
    "created_at": "2026-01-09T19:00:00Z"
  }
]
```

### GET /cook-orders/:orderId
Obtém detalhes de um pedido específico.

### POST /cook-orders
Adiciona um pedido à fila de preparação.

**Request:**
```json
{
  "order_id": "uuid",
  "order_number": 1,
  "items": [
    {
      "name": "X-Burger",
      "quantity": 2
    }
  ]
}
```

### PUT /cook-orders/:orderId
Atualiza status de preparação.

**Request:**
```json
{
  "status": "READY"
}
```

## 🔄 Fluxo de Preparação

```
1. Pedido confirmado → Adicionado à fila (RECEIVED)
2. Cozinha inicia → Status: PREPARING
3. Preparação concluída → Status: READY
4. Cliente retira → Status: DELIVERED
```

## 📊 Priorização de Pedidos

A fila utiliza algoritmo de priorização baseado em:
- **Tempo de espera**: Pedidos mais antigos têm prioridade
- **Tipo de pedido**: Pedidos express têm prioridade maior
- **Complexidade**: Pedidos simples são priorizados

## 🔗 Repositórios Relacionados

- **[fast-food](https://github.com/fiap-software-architecture-tech/fast-food)** - Aplicação Principal
- **[fast-food-order](https://github.com/fiap-software-architecture-tech/fast-food-order)** - Microsserviço de Pedidos
- **[fast-food-payment](https://github.com/fiap-software-architecture-tech/fast-food-payment)** - Microsserviço de Pagamentos
- **[fast-food-db-infra](https://github.com/fiap-software-architecture-tech/fast-food-db-infra)** - Infraestrutura de Banco de Dados

## 🔄 CI/CD

Este repositório possui workflows automatizados de CI/CD via GitHub Actions:

### CI (Integração Contínua)
- **Trigger**: Push e Pull Request para `modulo_4`
- **Jobs**:
  - Lint e validação de código
  - Build da aplicação
  - Execução de testes unitários
  - Cobertura de código
  - Security audit

### CD (Deploy Contínuo)
- **Trigger**: Merge para `modulo_4`
- **Jobs**:
  - Build e empacotamento Lambda
  - Deploy automático na AWS
  - Atualização da função Lambda

## 👥 Equipe

**Grupo 277 - SOAT FIAP**

- Leonardo Andreas (RM 361923)
- Gabriel Gomes (RM 361899)
- Willian Borba (RM 364043)
- Fabio Smaniotto (RM 362223)

## 📄 Licença

Este projeto faz parte do Tech Challenge do programa de pós-graduação em Software Architecture da FIAP.
