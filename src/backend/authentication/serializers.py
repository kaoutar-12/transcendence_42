from rest_framework import serializers, UserBasicSerializer
from .models import User ,TwoFactorAuth


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    twoFactorEnabled = serializers.SerializerMethodField()
    friends = serializers.SerializerMethodField()
    blocked_users = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password','nickname','profile_image','twoFactorEnabled'
                  ,'friends','blocked_users')
        extra_kwargs = {'password': {'write_only': True},
                        'nickname': {'required': False},
                        'profile_image': {'required': False} }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            nickname=validated_data['username']
        )
        return user
    
    def get_twoFactorEnabled(self, obj):
        try:
            return obj.twofactorauth.is_enabled
        except TwoFactorAuth.DoesNotExist:
            return False
    
    def get_friends(self, obj):
        return UserBasicSerializer(obj.friends.all(), many=True).data
    
    def get_blocked_users(self, obj):
        return UserBasicSerializer(obj.blocked_users.all(), many=True).data


    
class UserProfileImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['profile_image']


    
    