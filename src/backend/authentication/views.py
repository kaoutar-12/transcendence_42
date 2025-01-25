
from datetime import datetime
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import UserSerializer,UserProfileImageSerializer
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings




@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request):
    user = request.user
    data = request.data
    
    try:
        # Handle nickname update
        if 'nickname' in data:
            user.nickname = data['nickname']
        
        # Handle password update
        if 'currentPassword' in data and 'newPassword' in data:
            # Verify current password
            if not check_password(data['currentPassword'], user.password):
                return Response(
                    {'error': 'password is incorrect'}
                )
            
            # Set new password
            user.set_password(data['newPassword'])
        
        # Save the changes
        user.save()
        
        # Return updated user data
        serializer = UserSerializer(user)
        return Response({
            'message': 'Profile updated successfully',
            'user': serializer.data
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': serializer.data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({
            'error': 'Both username and password are required',
        })
    
    user = authenticate(email=email, password=password)
    
    if not user:
        return Response({
             'error': 'Invalid credentials'
        })
        
    refresh = RefreshToken.for_user(user)
    response = Response({
        'user': {
            'username': user.username,
            'email': user.email,
        },
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({'error': 'Refresh token is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
            
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        response = Response({'message': 'Successfully logged out'})
        response.set_cookie('access_token', '', expires=0)
        response.set_cookie('refresh_token', '', expires=0)

        
        return response

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token(request):
    return Response({'valid': True})


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile_image(request):
    serializer = UserProfileImageSerializer(
        request.user, 
        data=request.data, 
        partial=True
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profile image updated successfully',
            'image_url': request.user.profile_image.url
        })
    return Response(serializer.errors)
