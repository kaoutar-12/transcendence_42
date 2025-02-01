
from datetime import datetime
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken 
from django.contrib.auth import authenticate
from .serializers import UserSerializer,UserProfileImageSerializer
from django.contrib.auth.hashers import check_password
# from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings
from .models import TwoFactorAuth
from rest_framework_simplejwt.views import TokenRefreshView
from .two_factor_auth import verify_totp_code, generate_qr_code, generate_totp_uri, generate_totp_secret





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
        response = Response({'user': serializer.data,'message':"User register Successfully;"}, status=status.HTTP_201_CREATED)
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

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({
            'error': 'Both email and password are required',
        })
    user = authenticate(email=email, password=password)
    
    if not user:
        return Response({
             'error': 'Invalid credentials'
        })
    serialzer = UserSerializer(user)
    twoFactorEnabled=serialzer.data
    if twoFactorEnabled["twoFactorEnabled"] and not request.data.get('OTP'):
        return Response({
             'action': 'triger on'
        })
    elif twoFactorEnabled["twoFactorEnabled"] and  request.data.get('OTP'):
        two_factor = TwoFactorAuth.objects.get(user=serialzer.data['id'])
        if not verify_totp_code(two_factor.secret_key, request.data.get('OTP')):
            return Response({
             'error': 'Invalid verification code'
            })
        
    refresh = RefreshToken.for_user(user)
    response = Response({
        'user': {
            'username': user.username,
            'email': user.email,
        },
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
            return Response({'error': 'Refresh token is required'})
            
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        response = Response({'message': 'Successfully logged out'})
        response.set_cookie('access_token', '', expires=0)
        response.set_cookie('refresh_token', '', expires=0) 
        return response

    except Exception as e:
        return Response({'error': str(e)})

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




class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({"detail": "Refresh token is missing."}, status=status.HTTP_401_UNAUTHORIZED)

        # Temporarily set the refresh token into the request data.
        if request.data :
            request.data._mutable = True
            request.data['refresh'] = refresh_token
            request.data._mutable = False
        else : 
            request.data['refresh'] = refresh_token


        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            
            response.set_cookie(
                'access_token', response.data['access'],
                httponly=True, secure=request.is_secure(),
                max_age=settings.SIMPLE_JWT.get('ACCESS_TOKEN_LIFETIME').total_seconds()
            )
            response.data['access']='true'
        else :
            response.set_cookie('access_token', '', expires=0)
            response.set_cookie('refresh_token', '', expires=0)
            
        return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enable_2fa(request):
    try:
        # Check if 2FA already exists
        two_factor, created = TwoFactorAuth.objects.get_or_create(
            user=request.user,
            defaults={'secret_key': generate_totp_secret()}
        )
        
        if not created and two_factor.is_enabled:
            return Response({
                'error': '2FA is already enabled'
            })
        
        # Generate QR code
        uri = generate_totp_uri(
            two_factor.secret_key,
            request.user.email
        )
        qr_code = generate_qr_code(uri)
        
        return Response({
            'qr_code': qr_code
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_2fa(request):
    try:
        code = request.data.get('OTP')
        if not code:
            return Response({
                'error': 'Verification code is required'
            })
        
        two_factor = TwoFactorAuth.objects.get(user=request.user)
        
        if verify_totp_code(two_factor.secret_key, code):
            two_factor.is_enabled = True
            two_factor.save()
            return Response({
                'message': '2FA enabled successfully'
            })
        else:
            return Response({
                'error': 'Can u Try the Real Code please !!!'
            })
            
    except TwoFactorAuth.DoesNotExist:
        return Response({
            'error': '2FA setup not initiated'
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disable_2fa(request):
    try:
        two_factor = TwoFactorAuth.objects.get(user=request.user)
        
        if not two_factor.is_enabled:
            return Response({
                'error': 'enable 2Fa first Please'
            })
        
        two_factor.is_enabled = False
        two_factor.save()
        
        return Response({
            'message': '2FA disabled successfully'
        })
        
    except TwoFactorAuth.DoesNotExist:
        return Response({
            'error': 'enable 2Fa first Please'
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)