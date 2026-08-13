<?php

namespace App\Config;

class CloudinaryConfig
{
    public static function getCloudName(): string
    {
        return $_ENV['CLOUDINARY_CLOUD_NAME'] ?? '';
    }

    public static function getApiKey(): string
    {
        return $_ENV['CLOUDINARY_API_KEY'] ?? '';
    }

    public static function getApiSecret(): string
    {
        return $_ENV['CLOUDINARY_API_SECRET'] ?? '';
    }

    public static function getConfig(): array
    {
        return [
            'cloud_name' => self::getCloudName(),
            'api_key' => self::getApiKey(),
            'api_secret' => self::getApiSecret(),
            'secure' => true,
        ];
    }
}
