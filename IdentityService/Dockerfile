# שימוש בגרסת Alpine הקלילה והיציבה למק
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /app

COPY *.csproj ./
# הוספת דגל לביטול יצירת AppHost שגורם לקריסות
RUN dotnet restore

COPY . ./
# UseAppHost=false מונע יצירת קובץ exe שקורס על מעבדי ARM
RUN dotnet publish -c Release -o out /p:UseAppHost=false

# שלב הריצה - גם הוא על Alpine
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine
WORKDIR /app

# התקנת ספרייה שחובה עבור SQL Server ב-Alpine
RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

COPY --from=build /app/out .

EXPOSE 8080
ENTRYPOINT ["dotnet", "IdentityService.dll"]