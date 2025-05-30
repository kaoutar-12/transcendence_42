from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken 
from .serializers import UserSerializer,UserProfileImageSerializer
from django.conf import settings
from rest_framework import status
import secrets
import os



from .models import TwoFactorAuth,User

import requests


@api_view(['POST'])
@permission_classes([AllowAny])
def Oauth(request):
    
    code = request.data.get('code', None)
    # print(request.data)
    
    if not code:
        return Response({'message': 'Code is required'})
    url= os.environ.get('url')
    url1 = os.environ.get('url1')
    headers = {
        "Content-Type": "application/json",
    }
    body={
        'grant_type':'authorization_code',
        'client_id':os.environ.get('UID'),
        'client_secret':os.environ.get('SECRET'),
        'code': code,
        'redirect_uri': os.environ.get('redirect_uri'),
    }
    try:
        response = requests.post(url, json=body, headers=headers)        
        if (response.ok):
            data = response.json()
            headers["Authorization"] = f"Bearer {data['access_token']}"
            response1 = requests.get(url1, headers=headers) 
            if (response1.ok):
                data = response1.json()
                try:
                    user = User.objects.get(email=data["email"])
                    # login method 
                    serialzer = UserSerializer(user)
                    twoFactorEnabled=serialzer.data
                    if twoFactorEnabled["twoFactorEnabled"]:
                        request.session["pending_user_id"] = twoFactorEnabled["id"]
                        return Response({
                             'action': '2fa'
                        })    
                  
                    refresh = RefreshToken.for_user(user)
                    response = Response({
                        'message':"User entered Successfully;"
                    })
                    response.set_cookie(
                        'access_token',
                        refresh.access_token,
                        httponly=True,
                        secure=True,
                        )
                    response.set_cookie(
                        'refresh_token',
                        refresh,
                        httponly=True,
                        secure=True,
                        )
                    return response
                except User.DoesNotExist:
                    # register method 
                    transformed_data = {
                        'username': get_unique_username(data['first_name']),
                        'email': data['email'],
                        'nickname': data['login'],
                        'password': secrets.token_urlsafe(32),
                        'image_url': data['image']['link'],
                    }
                    serializer = UserSerializer(data=transformed_data, context={'is_42_user': True})
                    if serializer.is_valid():
                        user = serializer.save()
                        refresh = RefreshToken.for_user(user)
                        response = Response({'message':"User entered Successfully;"}, status=status.HTTP_201_CREATED)
                        response.set_cookie(
                            'access_token',
                            refresh.access_token,
                            httponly=True,
                            secure=True,
                            )
                        response.set_cookie(
                            'refresh_token',
                            refresh,
                            httponly=True,
                            secure=True,
                            )
                        return response
                    return Response(serializer.errors)
                    
        
        return Response({'message': 'code recived successfully'})
    except requests.exceptions.RequestException as e:
        return Response({"error": str(e)})
    
    
def get_unique_username(base_username):
    username = base_username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    
    return username
    