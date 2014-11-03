import csv
from datetime import datetime

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from peacecorps.models import Account


def datetime_from(text):
    """Convert a string representation of a datetime into a UTC datetime
    object."""
    # This format will no doubt change
    return timezone.make_aware(datetime.strptime(text, "%Y-%m-%d %H:%M:%S"),
                               timezone.get_current_timezone())


def cents_from(text):
    """Convert a string of comma-separated dollars and decimal cents into an
    int of cents"""
    text = text.replace(",", "").strip()
    #   intentionally allow errors to break the script
    dollars = float(text)
    return int(round(dollars * 100))


class Command(BaseCommand):
    help = """Synchronize Account and Transactions with a CSV.
              Generally, this means deleting transactions and updating the
              amount field in the account."""

    def handle(self, *args, **kwargs):
        if len(args) == 0:
            raise CommandError("Missing path to csv")

        with open(args[0]) as csvfile:
            # Column names will no doubt change
            for row in csv.DictReader(csvfile):
                account = Account.objects.filter(
                    code=row['PROJ_NO']).first()
                if account:
                    # Ignoring non-existing accounts - they're handled elsewhere
                    updated_at = datetime_from(row['LAST_UPDATED_FROM_PAYGOV'])
                    account.donations.filter(time__lte=updated_at).delete()
                    account.current = cents_from(row['REVENUE'])
                    account.save()