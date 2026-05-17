#!/usr/bin/env bash
set -euo pipefail

# Ensure mock companies include an id used for navigation fallback.
rg -q "id: 'google'" "app/(authenticated)/companies/mock-data.ts"

# Ensure both companies list and home companies tab route cards using company hrefs.
rg -q "href=\{getCompanyHref\(track.id\)\}" "app/(authenticated)/companies/CompaniesScreen.tsx"
rg -q "href=\{getCompanyHref\(track.companySummary.id\)\}" "app/(tabs)/home/HomeScreen.tsx"

# Ensure challenge navigation carries company query for return flow.
rg -Fq 'href={`/challenge/${challenge.id}?company=${companyId}' "app/(authenticated)/companies/[trackId]/CompanyDetailsScreen.tsx"

# Ensure challenge flow reads the company query param and marks the company list for refresh.
rg -Fq "searchParams.get('company')" "app/(authenticated)/challenge/[trackId]/QuizScreen.tsx"
rg -Fq "searchParams.get('company')" "app/(authenticated)/challenge/[trackId]/FeedbackScreen.tsx"
rg -Fq "markCompanyChallengeListStale(companyId)" "app/(authenticated)/challenge/[trackId]/QuizScreen.tsx"
rg -Fq "markCompanyChallengeListStale(companyId)" "app/(authenticated)/challenge/[trackId]/FeedbackScreen.tsx"
rg -Fq "consumeCompanyChallengeListRefresh(companyId)" "app/(authenticated)/companies/[trackId]/CompanyDetailsScreen.tsx"

echo "company navigation wiring assertions passed"
