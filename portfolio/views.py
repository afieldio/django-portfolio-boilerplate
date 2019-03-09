import urllib
import os
import json

from django.shortcuts import render, render_to_response, RequestContext
from django.views.static import serve
from django.template import Context
from django.template.loader import get_template
from django.shortcuts import redirect
from django.http import HttpResponse
from django.core.mail import EmailMessage
from django.contrib import messages

from portfolio.forms import ContactForm
from afieldio import settings


def home(request):

    if request.method == 'POST':
        form = ContactForm(request.POST)

        if form.is_valid():
            ''' Begin reCAPTCHA validation '''
            recaptcha_response = request.POST.get('g-recaptcha-response')
            url = 'https://www.google.com/recaptcha/api/siteverify'
            values = {
                'secret': settings.GOOGLE_RECAPTCHA_SECRET_KEY,
                'response': recaptcha_response
            }
            data = urllib.parse.urlencode(values).encode("utf-8")
            req = urllib.request.Request(url, data)
            response = urllib.request.urlopen(req)
            result = json.load(response)
            ''' End reCAPTCHA validation '''

            if result['success']:

                contact_name = request.POST.get('name', '')
                contact_email = request.POST.get('email', '')
                form_content = request.POST.get('description', '')
                # Email the profile with the
                # contact information
                template = get_template('contact_template.txt')
                context = Context({
                    'contact_name': contact_name,
                    'contact_email': contact_email,
                    'form_content': form_content,
                })

                content = template.render(context)

                email = EmailMessage(
                    "New contact form submission",
                    content,
                    "Your website" +'',
                    ['a.field738@gmail.com'],
                    headers = {'Reply-To': contact_email }
                )
                email.send()
                return redirect('home')
            else:
                messages.error(request, 'Invalid reCAPTCHA. Please try again.')

    else:
        form = ContactForm()

    context = RequestContext(request, {'form': form, })
    return render_to_response('home.html', context_instance=context)

def test(request):
    return render_to_response('test.html')

def game(request):
    return render_to_response('game.html')
