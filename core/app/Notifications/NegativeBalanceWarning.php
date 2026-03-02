<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

use App\Models\Wallet;

class NegativeBalanceWarning extends Notification
{
    use Queueable;

    public Wallet $wallet;

    /**
     * Create a new notification instance.
     */
    public function __construct(Wallet $wallet)
    {
        $this->wallet = $wallet;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail']; // Simulating default mail driver
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $balance = number_format(abs($this->wallet->balance_minor) / 100, 2);
        return (new MailMessage)
            ->subject('Action Required: Negative Wallet Balance Warning')
            ->greeting("Hello {$notifiable->name},")
            ->line("Your PITX Operator Wallet has dropped below zero.")
            ->line("Current Balance: -₱{$balance}")
            ->line("Please reload your wallet immediately to avoid service interruptions.")
            ->action('Top Up Wallet', url(env('FRONTEND_URL', 'http://localhost:5173') . '/portal/wallets'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
