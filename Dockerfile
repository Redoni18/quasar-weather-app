FROM node:22-alpine AS build

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy the rest of the application code
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy build artifacts and server code
COPY --from=build /app/dist/spa ./dist/spa
COPY --from=build /app/server ./server

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]
