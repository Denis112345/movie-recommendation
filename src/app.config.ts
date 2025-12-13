export default () => {
    const port = process.env.DB_PORT ?? '5432'
    return {
        database: {
            port: parseInt(port, 10),
            host: process.env.DB_HOST || 'localhost',
            db_name: process.env.DB_NAME || 'movie',
            username: process.env.DB_USER || 'movie',
            password: process.env.DB_PASSWORD || 'password',
            provider: process.env.DB_PROVIDER || 'postgres'
        },
        external_movie_api_token: process.env.EXTERNAL_MOVIE_API_TOKEN || ''
    }
}