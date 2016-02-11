from django import forms

class ContactForm(forms.ModelForm):
	name = forms.CharField(label='Name')
	email = forms.EmailField(label='Email')
	phone = forms.IntegerField(label='Phone')
	description = forms.CharField(label='Info')