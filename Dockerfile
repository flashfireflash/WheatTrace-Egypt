# Use the .NET 10 SDK for the build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY src/WheatTrace.Api/WheatTrace.Api.csproj src/WheatTrace.Api/
COPY src/WheatTrace.Application/WheatTrace.Application.csproj src/WheatTrace.Application/
COPY src/WheatTrace.Domain/WheatTrace.Domain.csproj src/WheatTrace.Domain/
COPY src/WheatTrace.Infrastructure/WheatTrace.Infrastructure.csproj src/WheatTrace.Infrastructure/

# Restore dependencies
RUN dotnet restore src/WheatTrace.Api/WheatTrace.Api.csproj

# Copy everything else and build the release
COPY src/ src/
WORKDIR /app/src/WheatTrace.Api
RUN dotnet publish -c Release -o /app/out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .

# ASP.NET Core will bind dynamically using the PORT env var in Program.cs.
ENTRYPOINT ["dotnet", "WheatTrace.Api.dll"]
