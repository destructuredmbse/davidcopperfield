module.exports = {
  apps: [{
    name: 'davidcopperfield',
    script: 'npm',
    args: 'start',
    cwd: '/home/web/www/destructuredmbse.org/davidcopperfield',
    env_file: '.env',
    env: {
      NODE_ENV: 'production',
      AUTH_SECRET: 'TC+fG9zQYMzSkafHh2EcfJ1WucsLQf8hY/aP6PguLeA=',
      AUTH_URL: 'https://destructuredmbse.org/davidcopperfield',
      NEXTAUTH_URL: 'https://destructuredmbse.org/davidcopperfield',
      AUTH_TRUST_HOST: 'true',
      GEL_INSTANCE: 'destructuredmbse/davidcopperfield',
      GEL_SECRET_KEY: 'nbwt1_eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJlZGIuZC5hbGwiOnRydWUsImVkYi5pIjpbImRlc3RydWN0dXJlZG1ic2UvZGF2aWRjb3BwZXJmaWVsZCJdLCJlZGIuci5hbGwiOnRydWUsImlhdCI6MTc2Mzc0NjI2MSwiaXNzIjoiYXdzLmVkZ2VkYi5jbG91ZCIsImp0aSI6IjJWc0NMc2JfRWZDc0FlTW9TLVRMSHciLCJzdWIiOiJZdHJKMU1iOEVmQzN3Vzh6bURibklnIn0.a6t-KuJGVqJaDJJrjSBNDJkqUXWqRKCRMp-jJgHxxHiWfkrp9qBowIxQ9j870PXAscto68FpZAYl5ycY5ZXZ5A'
    }
  }]
}