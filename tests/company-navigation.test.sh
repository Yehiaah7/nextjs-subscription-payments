#!/usr/bin/env bash
set -euo pipefail

# Ensure mock companies include an id used for navigation fallback.
rg -q "id: 'google'" app/companies/mock-data.ts

# Ensure both companies list and home companies tab route cards using company hrefs.
rg -q "href=\{getCompanyHref\(track.id\)\}" app/companies/CompaniesScreen.tsx
rg -q "href=\{getCompanyHref\(track.id\)\}" app/home/HomeScreen.tsx

echo "company navigation wiring assertions passed"
