# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the csproj (space in filename means we quote it)
COPY "weather backend/weather backend.csproj" "./"
RUN dotnet restore "./weather backend.csproj"

# Copy the rest of the backend code
COPY "weather backend/" ./
RUN dotnet publish "./weather backend.csproj" -c Release -o /app/out

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./

# Render sets PORT automatically
ENV ASPNETCORE_URLS=http://+:${PORT:-10000}
EXPOSE 10000

ENTRYPOINT ["dotnet", "weather backend.dll"]
