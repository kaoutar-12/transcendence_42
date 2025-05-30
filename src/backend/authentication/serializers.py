from rest_framework import serializers
from .models import User ,TwoFactorAuth
import requests
from django.core.files.base import ContentFile


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'nickname', 'profile_image')

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    twoFactorEnabled = serializers.SerializerMethodField()
    friends = serializers.SerializerMethodField()
    blocked_users = serializers.SerializerMethodField()
    image_url = serializers.URLField(write_only=True, required=False)
    is_friend = serializers.SerializerMethodField()
    is_blocked = serializers.SerializerMethodField()
    profile_image = serializers.ImageField(use_url=False,required=False)
    is_online = serializers.BooleanField(required=False)



    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password','nickname','profile_image','twoFactorEnabled', 'image_url', 'is_42','is_online'
                  ,'friends','blocked_users','is_friend','is_blocked')
        extra_kwargs = {'password': {'write_only': True},
                        'nickname': {'required': False},
                        'profile_image': {'required': False}}
    
    def get_is_blocked(self, obj):
        request = self.context.get('request')
        if request:
            try:
                requesting_user_profile = request.user
                return obj in requesting_user_profile.blocked_users.all()
            except User.DoesNotExist:
                return False
        return False
    
    def get_is_friend(self, obj):
        request = self.context.get('request')
        if request:
            try:
                requesting_user_profile = request.user
                return obj in requesting_user_profile.friends.all()
            except User.DoesNotExist:
                return False
        return False

    
    def create(self, validated_data):
        if 'is_42_user' in self.context:  
            return self.create_42_user(validated_data)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            nickname=validated_data['username']
        )
        return user
    
    def create_42_user(self, validated_data):
        image_url = validated_data.pop('image_url', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            nickname=validated_data['nickname'],
            is_42=True,
        )
        if image_url:
            try:
                response = requests.get(image_url)
                if response.status_code == 200:
                    image_name = image_url.split('/')[-1]
                    user.profile_image.save(
                        image_name,
                        ContentFile(response.content),
                        save=True
                    )
            except Exception as e:
                print(f"Error downloading image: {e}")
        
        
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


    
    