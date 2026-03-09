#!/usr/bin/env bash
set -euo pipefail

# Ensure mock companies include an id used for navigation fallback.
rg -q "id: 'google'" "app/(authenticated)/companies/mock-data.ts"

# Ensure both companies list and home companies tab route cards using company hrefs.
rg -q "href=\{getCompanyHref\(track.id\)\}" "app/(authenticated)/companies/CompaniesScreen.tsx"
rg -q "href=\{getCompanyHref\(track.id\)\}" "app/(authenticated)/home/HomeScreen.tsx"

# Ensure challenge navigation includes company query to support challenge return flow.
rg -Fq 'href={`/challenge/${challenge.id}?company=${company.id}`}' "app/(authenticated)/companies/[id]/CompanyDetailsScreen.tsx"

# Ensure challenge flow reads and forwards the company query param.
rg -Fq "searchParams.get('company')" "app/(authenticated)/challenge/[id]/QuizScreen.tsx"
rg -Fq "searchParams.get('company')" "app/(authenticated)/challenge/[id]/FeedbackScreen.tsx"

echo "company navigation wiring assertions passed"
