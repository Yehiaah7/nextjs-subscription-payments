#!/usr/bin/env bash
set -euo pipefail

# Ensure mock companies include an id used for navigation fallback.
rg -q "id: 'google'" app/companies/mock-data.ts

# Ensure both companies list and home companies tab route cards using company hrefs.
rg -q "href=\{getCompanyHref\(track.id\)\}" app/companies/CompaniesScreen.tsx
rg -q "href=\{getCompanyHref\(track.id\)\}" app/home/HomeScreen.tsx


# Ensure challenge navigation includes company query to support challenge return flow.
rg -Fq 'href={`/challenge/${challenge.id}?company=${company.id}`}' 'app/companies/[id]/CompanyDetailsScreen.tsx'

# Ensure challenge flow reads and forwards the company query param.
rg -Fq "searchParams.get('company')" 'app/challenge/[id]/QuizScreen.tsx'
rg -Fq "searchParams.get('company')" 'app/challenge/[id]/FeedbackScreen.tsx'

echo "company navigation wiring assertions passed"
