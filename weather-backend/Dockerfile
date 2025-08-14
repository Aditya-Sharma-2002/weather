# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the csproj
COPY "weather-backend.csproj" "./"
RUN dotnet restore "./weather-backend.csproj"

# Copy the rest of the backend code
COPY . .
RUN dotnet publish "./weather-backend.csproj" -c Release -o /app/out

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./

ENV ASPNETCORE_URLS=http://+:${PORT:-10000}
EXPOSE 10000

ENTRYPOINT ["dotnet", "weather-backend.dll"]
