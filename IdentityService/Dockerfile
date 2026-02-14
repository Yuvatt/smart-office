
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /app

COPY *.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o out /p:UseAppHost=false


FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine
WORKDIR /app

RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

COPY --from=build /app/out .

EXPOSE 8080
ENTRYPOINT ["dotnet", "IdentityService.dll"]