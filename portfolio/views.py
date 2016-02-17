from django.shortcuts import render, render_to_response, RequestContext
from django.views.static import serve
from django.template import Context
from django.template.loader import get_template
from django.shortcuts import redirect
from django.http import HttpResponse

from portfolio.forms import ContactForm

from django.core.mail import EmailMessage

import os

# Create your views here.


def home(request):

    if request.method == 'POST':
        form = ContactForm(request.POST)

        if form.is_valid():

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
        form = ContactForm()

    context = RequestContext(request, {'form': form, })
    return render_to_response('home.html', context_instance=context)


def download(request):
    filepath = '/Users/adamf/Development/afieldio/afieldio/portfolio/static/portfolio/afield_cv.pdf'
    response = HttpResponse()
    
    response['X-Sendfile'] = filepath
    response['Content-Type'] = ''
    return response

    # return serve(request, os.path.basename(filepath), os.path.dirname(filepath))
