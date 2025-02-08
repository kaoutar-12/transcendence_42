from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken 
from .serializers import UserSerializer,UserProfileImageSerializer
from django.conf import settings
from rest_framework import status
import secrets



from .models import TwoFactorAuth,User

import requests


@api_view(['POST'])
@permission_classes([AllowAny])
def Oauth(request):
    
    code = request.data.get('code', None)
    # print(request.data)
    
    if not code:
        return Response({'message': 'Code is required'})
    url= "https://api.intra.42.fr/oauth/token/"
    url1 = "https://api.intra.42.fr/v2/me/"
    headers = {
        "Content-Type": "application/json",
    }
    body={
        'grant_type':'authorization_code',
        'client_id':'u-s4t2ud-4719e3779c459d1f6e4055ac6167c2cdc82154e41df26314bb0cdca56a1210e1',
        'client_secret':'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',
        'code': code,
        'redirect_uri': 'http://localhost:3000/call/',
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
                  
                    refresh = RefreshToken.for_user(user)
                    response = Response({
                        'message':"User entered Successfully;"
                    })
                    response.set_cookie(
                        'access_token',
                        refresh.access_token,
                        httponly=True,
                        # secure=True,
                        samesite='Strict',
                        max_age=settings.SIMPLE_JWT.get('ACCESS_TOKEN_LIFETIME').total_seconds()
                        )
                    response.set_cookie(
                        'refresh_token',
                        refresh,
                        httponly=True,
                        # secure=True,
                        samesite='Strict',
                        max_age=settings.SIMPLE_JWT.get('REFRESH_TOKEN_LIFETIME').total_seconds()
                        )
                    return response
                except User.DoesNotExist:
                    # register method 
                    transformed_data = {
                        'username': data['first_name'],
                        'email': data['email'],
                        'nickname': data['login'],
                        'password': secrets.token_urlsafe(32)
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
                            # secure=True,
                            samesite='Strict',
                            max_age=settings.SIMPLE_JWT.get('ACCESS_TOKEN_LIFETIME').total_seconds()
                            )
                        response.set_cookie(
                            'refresh_token',
                            refresh,
                            httponly=True,
                            # secure=True,
                            samesite='Strict',
                            max_age=settings.SIMPLE_JWT.get('REFRESH_TOKEN_LIFETIME').total_seconds()
                            )
                        return response
                    return Response(serializer.errors)
                    
        
        return Response({'message': 'code recived successfully'})
    except requests.exceptions.RequestException as e:
        return Response({"error": str(e)})
    print(code)
    return Response({'message': 'code recived successfully'})