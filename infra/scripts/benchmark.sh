#!/bin/bash

# Colors for readable output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 SUPABASE DOCKER COMPOSE PERFORMANCE VERIFICATION${NC}\n"

echo -e "${YELLOW}⏳ 1. SYSTEM LATENCY AND RESPONSIVENESS TEST${NC}"

# Auth (GoTrue) Test
echo -n "Authentication (supabase-auth) response latency: "
docker exec supabase-auth time -p wget --no-verbose --tries=1 --spider http://localhost:9999/health 2>&1 | grep real | awk '{print $2" seconds"}'

# Storage API Test
echo -n "Storage API (supabase-storage) response latency: "
docker exec supabase-storage time -p wget --no-verbose --tries=1 --spider http://storage:5000/status 2>&1 | grep real | awk '{print $2" seconds"}'

# DB (Postgres) Test
echo -n "Database (supabase-db) connection latency: "
(time docker exec supabase-db pg_isready -U postgres -h localhost > /dev/null 2>&1) 2>&1 | grep real | awk '{print $2" seconds"}'

# API Gateway (Kong) Test
echo -n "Kong API Gateway (supabase-kong) health check latency: "
(time docker exec supabase-kong kong health > /dev/null 2>&1) 2>&1 | grep real | awk '{print $2" seconds"}'


echo -e "\n${YELLOW}💾 2. STORAGE THROUGHPUT ANALYSIS (DISK I/O)${NC}"
echo "Running write tests (100MB) to calculate disk bandwidth..."

# Storage-data volume test (Using conv=sync instead of fdatasync)
echo -e "\n> ${GREEN}Storage API Volume (/var/lib/storage):${NC}"
docker exec supabase-storage sh -c "dd if=/dev/zero of=/var/lib/storage/test_io bs=1M count=100 conv=sync 2>&1 | tail -n 1"
# Cleanup temp file
docker exec supabase-storage rm -f /var/lib/storage/test_io

# Db-data volume test (Using conv=sync instead of fdatasync)
echo -e "\n> ${GREEN}Postgres Database Volume (/var/lib/postgresql/data):${NC}"
docker exec supabase-db sh -c "dd if=/dev/zero of=/var/lib/postgresql/data/test_io bs=1M count=100 conv=sync 2>&1 | tail -n 1"
# Cleanup temp file
docker exec supabase-db rm -f /var/lib/postgresql/data/test_io


echo -e "\n${YELLOW}📈 3. CONTAINERIZED RESOURCE MONITORING${NC}"
echo "Instant snapshot of CPU, RAM, and I/O usage for all active services:"
echo ""

# Use docker stats in no-stream mode for a quick printed report
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}" | grep -E "supabase|nginx|web-app|NAME"

echo -e "\n${GREEN}✅ Performance test completed.${NC}"